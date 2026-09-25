// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'credential_login_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CredentialLoginResponseDtoOutputTokenTypeEnum
    _$credentialLoginResponseDtoOutputTokenTypeEnum_bearer =
    const CredentialLoginResponseDtoOutputTokenTypeEnum._('bearer');

CredentialLoginResponseDtoOutputTokenTypeEnum
    _$credentialLoginResponseDtoOutputTokenTypeEnumValueOf(String name) {
  switch (name) {
    case 'bearer':
      return _$credentialLoginResponseDtoOutputTokenTypeEnum_bearer;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialLoginResponseDtoOutputTokenTypeEnum>
    _$credentialLoginResponseDtoOutputTokenTypeEnumValues = BuiltSet<
        CredentialLoginResponseDtoOutputTokenTypeEnum>(const <CredentialLoginResponseDtoOutputTokenTypeEnum>[
  _$credentialLoginResponseDtoOutputTokenTypeEnum_bearer,
]);

const CredentialLoginResponseDtoOutputScopeEnum
    _$credentialLoginResponseDtoOutputScopeEnum_passenger =
    const CredentialLoginResponseDtoOutputScopeEnum._('passenger');
const CredentialLoginResponseDtoOutputScopeEnum
    _$credentialLoginResponseDtoOutputScopeEnum_operator_ =
    const CredentialLoginResponseDtoOutputScopeEnum._('operator_');
const CredentialLoginResponseDtoOutputScopeEnum
    _$credentialLoginResponseDtoOutputScopeEnum_platform =
    const CredentialLoginResponseDtoOutputScopeEnum._('platform');

CredentialLoginResponseDtoOutputScopeEnum
    _$credentialLoginResponseDtoOutputScopeEnumValueOf(String name) {
  switch (name) {
    case 'passenger':
      return _$credentialLoginResponseDtoOutputScopeEnum_passenger;
    case 'operator_':
      return _$credentialLoginResponseDtoOutputScopeEnum_operator_;
    case 'platform':
      return _$credentialLoginResponseDtoOutputScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialLoginResponseDtoOutputScopeEnum>
    _$credentialLoginResponseDtoOutputScopeEnumValues = BuiltSet<
        CredentialLoginResponseDtoOutputScopeEnum>(const <CredentialLoginResponseDtoOutputScopeEnum>[
  _$credentialLoginResponseDtoOutputScopeEnum_passenger,
  _$credentialLoginResponseDtoOutputScopeEnum_operator_,
  _$credentialLoginResponseDtoOutputScopeEnum_platform,
]);

const CredentialLoginResponseDtoOutputMfaRequiredEnum
    _$credentialLoginResponseDtoOutputMfaRequiredEnum_true_ =
    const CredentialLoginResponseDtoOutputMfaRequiredEnum._('true_');

CredentialLoginResponseDtoOutputMfaRequiredEnum
    _$credentialLoginResponseDtoOutputMfaRequiredEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$credentialLoginResponseDtoOutputMfaRequiredEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialLoginResponseDtoOutputMfaRequiredEnum>
    _$credentialLoginResponseDtoOutputMfaRequiredEnumValues = BuiltSet<
        CredentialLoginResponseDtoOutputMfaRequiredEnum>(const <CredentialLoginResponseDtoOutputMfaRequiredEnum>[
  _$credentialLoginResponseDtoOutputMfaRequiredEnum_true_,
]);

const CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum
    _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnum_true_ =
    const CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum._('true_');

CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum
    _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumValueOf(
        String name) {
  switch (name) {
    case 'true_':
      return _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum>
    _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumValues =
    BuiltSet<
        CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum>(const <CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum>[
  _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnum_true_,
]);

Serializer<CredentialLoginResponseDtoOutputTokenTypeEnum>
    _$credentialLoginResponseDtoOutputTokenTypeEnumSerializer =
    _$CredentialLoginResponseDtoOutputTokenTypeEnumSerializer();
Serializer<CredentialLoginResponseDtoOutputScopeEnum>
    _$credentialLoginResponseDtoOutputScopeEnumSerializer =
    _$CredentialLoginResponseDtoOutputScopeEnumSerializer();
Serializer<CredentialLoginResponseDtoOutputMfaRequiredEnum>
    _$credentialLoginResponseDtoOutputMfaRequiredEnumSerializer =
    _$CredentialLoginResponseDtoOutputMfaRequiredEnumSerializer();
Serializer<CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum>
    _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumSerializer =
    _$CredentialLoginResponseDtoOutputPasswordChangeRequiredEnumSerializer();

class _$CredentialLoginResponseDtoOutputTokenTypeEnumSerializer
    implements
        PrimitiveSerializer<CredentialLoginResponseDtoOutputTokenTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'bearer': 'Bearer',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'Bearer': 'bearer',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CredentialLoginResponseDtoOutputTokenTypeEnum
  ];
  @override
  final String wireName = 'CredentialLoginResponseDtoOutputTokenTypeEnum';

  @override
  Object serialize(Serializers serializers,
          CredentialLoginResponseDtoOutputTokenTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialLoginResponseDtoOutputTokenTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialLoginResponseDtoOutputTokenTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialLoginResponseDtoOutputScopeEnumSerializer
    implements PrimitiveSerializer<CredentialLoginResponseDtoOutputScopeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'passenger': 'passenger',
    'operator_': 'operator',
    'platform': 'platform',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'passenger': 'passenger',
    'operator': 'operator_',
    'platform': 'platform',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CredentialLoginResponseDtoOutputScopeEnum
  ];
  @override
  final String wireName = 'CredentialLoginResponseDtoOutputScopeEnum';

  @override
  Object serialize(Serializers serializers,
          CredentialLoginResponseDtoOutputScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialLoginResponseDtoOutputScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialLoginResponseDtoOutputScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialLoginResponseDtoOutputMfaRequiredEnumSerializer
    implements
        PrimitiveSerializer<CredentialLoginResponseDtoOutputMfaRequiredEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CredentialLoginResponseDtoOutputMfaRequiredEnum
  ];
  @override
  final String wireName = 'CredentialLoginResponseDtoOutputMfaRequiredEnum';

  @override
  Object serialize(Serializers serializers,
          CredentialLoginResponseDtoOutputMfaRequiredEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialLoginResponseDtoOutputMfaRequiredEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialLoginResponseDtoOutputMfaRequiredEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialLoginResponseDtoOutputPasswordChangeRequiredEnumSerializer
    implements
        PrimitiveSerializer<
            CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum
  ];
  @override
  final String wireName =
      'CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum';

  @override
  Object serialize(Serializers serializers,
          CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialLoginResponseDtoOutput
    extends CredentialLoginResponseDtoOutput {
  @override
  final AnyOf anyOf;

  factory _$CredentialLoginResponseDtoOutput(
          [void Function(CredentialLoginResponseDtoOutputBuilder)? updates]) =>
      (CredentialLoginResponseDtoOutputBuilder()..update(updates))._build();

  _$CredentialLoginResponseDtoOutput._({required this.anyOf}) : super._();
  @override
  CredentialLoginResponseDtoOutput rebuild(
          void Function(CredentialLoginResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CredentialLoginResponseDtoOutputBuilder toBuilder() =>
      CredentialLoginResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CredentialLoginResponseDtoOutput && anyOf == other.anyOf;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, anyOf.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CredentialLoginResponseDtoOutput')
          ..add('anyOf', anyOf))
        .toString();
  }
}

class CredentialLoginResponseDtoOutputBuilder
    implements
        Builder<CredentialLoginResponseDtoOutput,
            CredentialLoginResponseDtoOutputBuilder> {
  _$CredentialLoginResponseDtoOutput? _$v;

  AnyOf? _anyOf;
  AnyOf? get anyOf => _$this._anyOf;
  set anyOf(AnyOf? anyOf) => _$this._anyOf = anyOf;

  CredentialLoginResponseDtoOutputBuilder() {
    CredentialLoginResponseDtoOutput._defaults(this);
  }

  CredentialLoginResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _anyOf = $v.anyOf;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CredentialLoginResponseDtoOutput other) {
    _$v = other as _$CredentialLoginResponseDtoOutput;
  }

  @override
  void update(void Function(CredentialLoginResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CredentialLoginResponseDtoOutput build() => _build();

  _$CredentialLoginResponseDtoOutput _build() {
    final _$result = _$v ??
        _$CredentialLoginResponseDtoOutput._(
          anyOf: BuiltValueNullFieldError.checkNotNull(
              anyOf, r'CredentialLoginResponseDtoOutput', 'anyOf'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
