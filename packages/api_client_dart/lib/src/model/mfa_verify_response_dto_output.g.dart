// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_verify_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MfaVerifyResponseDtoOutputTokenTypeEnum
    _$mfaVerifyResponseDtoOutputTokenTypeEnum_bearer =
    const MfaVerifyResponseDtoOutputTokenTypeEnum._('bearer');

MfaVerifyResponseDtoOutputTokenTypeEnum
    _$mfaVerifyResponseDtoOutputTokenTypeEnumValueOf(String name) {
  switch (name) {
    case 'bearer':
      return _$mfaVerifyResponseDtoOutputTokenTypeEnum_bearer;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyResponseDtoOutputTokenTypeEnum>
    _$mfaVerifyResponseDtoOutputTokenTypeEnumValues = BuiltSet<
        MfaVerifyResponseDtoOutputTokenTypeEnum>(const <MfaVerifyResponseDtoOutputTokenTypeEnum>[
  _$mfaVerifyResponseDtoOutputTokenTypeEnum_bearer,
]);

const MfaVerifyResponseDtoOutputScopeEnum
    _$mfaVerifyResponseDtoOutputScopeEnum_passenger =
    const MfaVerifyResponseDtoOutputScopeEnum._('passenger');
const MfaVerifyResponseDtoOutputScopeEnum
    _$mfaVerifyResponseDtoOutputScopeEnum_operator_ =
    const MfaVerifyResponseDtoOutputScopeEnum._('operator_');
const MfaVerifyResponseDtoOutputScopeEnum
    _$mfaVerifyResponseDtoOutputScopeEnum_platform =
    const MfaVerifyResponseDtoOutputScopeEnum._('platform');

MfaVerifyResponseDtoOutputScopeEnum
    _$mfaVerifyResponseDtoOutputScopeEnumValueOf(String name) {
  switch (name) {
    case 'passenger':
      return _$mfaVerifyResponseDtoOutputScopeEnum_passenger;
    case 'operator_':
      return _$mfaVerifyResponseDtoOutputScopeEnum_operator_;
    case 'platform':
      return _$mfaVerifyResponseDtoOutputScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyResponseDtoOutputScopeEnum>
    _$mfaVerifyResponseDtoOutputScopeEnumValues = BuiltSet<
        MfaVerifyResponseDtoOutputScopeEnum>(const <MfaVerifyResponseDtoOutputScopeEnum>[
  _$mfaVerifyResponseDtoOutputScopeEnum_passenger,
  _$mfaVerifyResponseDtoOutputScopeEnum_operator_,
  _$mfaVerifyResponseDtoOutputScopeEnum_platform,
]);

const MfaVerifyResponseDtoOutputMfaRequiredEnum
    _$mfaVerifyResponseDtoOutputMfaRequiredEnum_false_ =
    const MfaVerifyResponseDtoOutputMfaRequiredEnum._('false_');

MfaVerifyResponseDtoOutputMfaRequiredEnum
    _$mfaVerifyResponseDtoOutputMfaRequiredEnumValueOf(String name) {
  switch (name) {
    case 'false_':
      return _$mfaVerifyResponseDtoOutputMfaRequiredEnum_false_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyResponseDtoOutputMfaRequiredEnum>
    _$mfaVerifyResponseDtoOutputMfaRequiredEnumValues = BuiltSet<
        MfaVerifyResponseDtoOutputMfaRequiredEnum>(const <MfaVerifyResponseDtoOutputMfaRequiredEnum>[
  _$mfaVerifyResponseDtoOutputMfaRequiredEnum_false_,
]);

const MfaVerifyResponseDtoOutputAuthenticatedEnum
    _$mfaVerifyResponseDtoOutputAuthenticatedEnum_true_ =
    const MfaVerifyResponseDtoOutputAuthenticatedEnum._('true_');

MfaVerifyResponseDtoOutputAuthenticatedEnum
    _$mfaVerifyResponseDtoOutputAuthenticatedEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$mfaVerifyResponseDtoOutputAuthenticatedEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyResponseDtoOutputAuthenticatedEnum>
    _$mfaVerifyResponseDtoOutputAuthenticatedEnumValues = BuiltSet<
        MfaVerifyResponseDtoOutputAuthenticatedEnum>(const <MfaVerifyResponseDtoOutputAuthenticatedEnum>[
  _$mfaVerifyResponseDtoOutputAuthenticatedEnum_true_,
]);

Serializer<MfaVerifyResponseDtoOutputTokenTypeEnum>
    _$mfaVerifyResponseDtoOutputTokenTypeEnumSerializer =
    _$MfaVerifyResponseDtoOutputTokenTypeEnumSerializer();
Serializer<MfaVerifyResponseDtoOutputScopeEnum>
    _$mfaVerifyResponseDtoOutputScopeEnumSerializer =
    _$MfaVerifyResponseDtoOutputScopeEnumSerializer();
Serializer<MfaVerifyResponseDtoOutputMfaRequiredEnum>
    _$mfaVerifyResponseDtoOutputMfaRequiredEnumSerializer =
    _$MfaVerifyResponseDtoOutputMfaRequiredEnumSerializer();
Serializer<MfaVerifyResponseDtoOutputAuthenticatedEnum>
    _$mfaVerifyResponseDtoOutputAuthenticatedEnumSerializer =
    _$MfaVerifyResponseDtoOutputAuthenticatedEnumSerializer();

class _$MfaVerifyResponseDtoOutputTokenTypeEnumSerializer
    implements PrimitiveSerializer<MfaVerifyResponseDtoOutputTokenTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'bearer': 'Bearer',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'Bearer': 'bearer',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyResponseDtoOutputTokenTypeEnum
  ];
  @override
  final String wireName = 'MfaVerifyResponseDtoOutputTokenTypeEnum';

  @override
  Object serialize(Serializers serializers,
          MfaVerifyResponseDtoOutputTokenTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyResponseDtoOutputTokenTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyResponseDtoOutputTokenTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyResponseDtoOutputScopeEnumSerializer
    implements PrimitiveSerializer<MfaVerifyResponseDtoOutputScopeEnum> {
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
    MfaVerifyResponseDtoOutputScopeEnum
  ];
  @override
  final String wireName = 'MfaVerifyResponseDtoOutputScopeEnum';

  @override
  Object serialize(
          Serializers serializers, MfaVerifyResponseDtoOutputScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyResponseDtoOutputScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyResponseDtoOutputScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyResponseDtoOutputMfaRequiredEnumSerializer
    implements PrimitiveSerializer<MfaVerifyResponseDtoOutputMfaRequiredEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'false_': 'false',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'false': 'false_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyResponseDtoOutputMfaRequiredEnum
  ];
  @override
  final String wireName = 'MfaVerifyResponseDtoOutputMfaRequiredEnum';

  @override
  Object serialize(Serializers serializers,
          MfaVerifyResponseDtoOutputMfaRequiredEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyResponseDtoOutputMfaRequiredEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyResponseDtoOutputMfaRequiredEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyResponseDtoOutputAuthenticatedEnumSerializer
    implements
        PrimitiveSerializer<MfaVerifyResponseDtoOutputAuthenticatedEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyResponseDtoOutputAuthenticatedEnum
  ];
  @override
  final String wireName = 'MfaVerifyResponseDtoOutputAuthenticatedEnum';

  @override
  Object serialize(Serializers serializers,
          MfaVerifyResponseDtoOutputAuthenticatedEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyResponseDtoOutputAuthenticatedEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyResponseDtoOutputAuthenticatedEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyResponseDtoOutput extends MfaVerifyResponseDtoOutput {
  @override
  final AnyOf anyOf;

  factory _$MfaVerifyResponseDtoOutput(
          [void Function(MfaVerifyResponseDtoOutputBuilder)? updates]) =>
      (MfaVerifyResponseDtoOutputBuilder()..update(updates))._build();

  _$MfaVerifyResponseDtoOutput._({required this.anyOf}) : super._();
  @override
  MfaVerifyResponseDtoOutput rebuild(
          void Function(MfaVerifyResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MfaVerifyResponseDtoOutputBuilder toBuilder() =>
      MfaVerifyResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaVerifyResponseDtoOutput && anyOf == other.anyOf;
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
    return (newBuiltValueToStringHelper(r'MfaVerifyResponseDtoOutput')
          ..add('anyOf', anyOf))
        .toString();
  }
}

class MfaVerifyResponseDtoOutputBuilder
    implements
        Builder<MfaVerifyResponseDtoOutput, MfaVerifyResponseDtoOutputBuilder> {
  _$MfaVerifyResponseDtoOutput? _$v;

  AnyOf? _anyOf;
  AnyOf? get anyOf => _$this._anyOf;
  set anyOf(AnyOf? anyOf) => _$this._anyOf = anyOf;

  MfaVerifyResponseDtoOutputBuilder() {
    MfaVerifyResponseDtoOutput._defaults(this);
  }

  MfaVerifyResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _anyOf = $v.anyOf;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaVerifyResponseDtoOutput other) {
    _$v = other as _$MfaVerifyResponseDtoOutput;
  }

  @override
  void update(void Function(MfaVerifyResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaVerifyResponseDtoOutput build() => _build();

  _$MfaVerifyResponseDtoOutput _build() {
    final _$result = _$v ??
        _$MfaVerifyResponseDtoOutput._(
          anyOf: BuiltValueNullFieldError.checkNotNull(
              anyOf, r'MfaVerifyResponseDtoOutput', 'anyOf'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
