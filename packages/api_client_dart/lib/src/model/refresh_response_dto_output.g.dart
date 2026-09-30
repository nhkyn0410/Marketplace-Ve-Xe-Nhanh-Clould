// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refresh_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RefreshResponseDtoOutputTokenTypeEnum
    _$refreshResponseDtoOutputTokenTypeEnum_bearer =
    const RefreshResponseDtoOutputTokenTypeEnum._('bearer');

RefreshResponseDtoOutputTokenTypeEnum
    _$refreshResponseDtoOutputTokenTypeEnumValueOf(String name) {
  switch (name) {
    case 'bearer':
      return _$refreshResponseDtoOutputTokenTypeEnum_bearer;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshResponseDtoOutputTokenTypeEnum>
    _$refreshResponseDtoOutputTokenTypeEnumValues = BuiltSet<
        RefreshResponseDtoOutputTokenTypeEnum>(const <RefreshResponseDtoOutputTokenTypeEnum>[
  _$refreshResponseDtoOutputTokenTypeEnum_bearer,
]);

const RefreshResponseDtoOutputScopeEnum
    _$refreshResponseDtoOutputScopeEnum_passenger =
    const RefreshResponseDtoOutputScopeEnum._('passenger');
const RefreshResponseDtoOutputScopeEnum
    _$refreshResponseDtoOutputScopeEnum_operator_ =
    const RefreshResponseDtoOutputScopeEnum._('operator_');
const RefreshResponseDtoOutputScopeEnum
    _$refreshResponseDtoOutputScopeEnum_platform =
    const RefreshResponseDtoOutputScopeEnum._('platform');

RefreshResponseDtoOutputScopeEnum _$refreshResponseDtoOutputScopeEnumValueOf(
    String name) {
  switch (name) {
    case 'passenger':
      return _$refreshResponseDtoOutputScopeEnum_passenger;
    case 'operator_':
      return _$refreshResponseDtoOutputScopeEnum_operator_;
    case 'platform':
      return _$refreshResponseDtoOutputScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshResponseDtoOutputScopeEnum>
    _$refreshResponseDtoOutputScopeEnumValues = BuiltSet<
        RefreshResponseDtoOutputScopeEnum>(const <RefreshResponseDtoOutputScopeEnum>[
  _$refreshResponseDtoOutputScopeEnum_passenger,
  _$refreshResponseDtoOutputScopeEnum_operator_,
  _$refreshResponseDtoOutputScopeEnum_platform,
]);

const RefreshResponseDtoOutputAuthenticatedEnum
    _$refreshResponseDtoOutputAuthenticatedEnum_true_ =
    const RefreshResponseDtoOutputAuthenticatedEnum._('true_');

RefreshResponseDtoOutputAuthenticatedEnum
    _$refreshResponseDtoOutputAuthenticatedEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$refreshResponseDtoOutputAuthenticatedEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshResponseDtoOutputAuthenticatedEnum>
    _$refreshResponseDtoOutputAuthenticatedEnumValues = BuiltSet<
        RefreshResponseDtoOutputAuthenticatedEnum>(const <RefreshResponseDtoOutputAuthenticatedEnum>[
  _$refreshResponseDtoOutputAuthenticatedEnum_true_,
]);

Serializer<RefreshResponseDtoOutputTokenTypeEnum>
    _$refreshResponseDtoOutputTokenTypeEnumSerializer =
    _$RefreshResponseDtoOutputTokenTypeEnumSerializer();
Serializer<RefreshResponseDtoOutputScopeEnum>
    _$refreshResponseDtoOutputScopeEnumSerializer =
    _$RefreshResponseDtoOutputScopeEnumSerializer();
Serializer<RefreshResponseDtoOutputAuthenticatedEnum>
    _$refreshResponseDtoOutputAuthenticatedEnumSerializer =
    _$RefreshResponseDtoOutputAuthenticatedEnumSerializer();

class _$RefreshResponseDtoOutputTokenTypeEnumSerializer
    implements PrimitiveSerializer<RefreshResponseDtoOutputTokenTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'bearer': 'Bearer',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'Bearer': 'bearer',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RefreshResponseDtoOutputTokenTypeEnum
  ];
  @override
  final String wireName = 'RefreshResponseDtoOutputTokenTypeEnum';

  @override
  Object serialize(
          Serializers serializers, RefreshResponseDtoOutputTokenTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshResponseDtoOutputTokenTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshResponseDtoOutputTokenTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshResponseDtoOutputScopeEnumSerializer
    implements PrimitiveSerializer<RefreshResponseDtoOutputScopeEnum> {
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
  final Iterable<Type> types = const <Type>[RefreshResponseDtoOutputScopeEnum];
  @override
  final String wireName = 'RefreshResponseDtoOutputScopeEnum';

  @override
  Object serialize(
          Serializers serializers, RefreshResponseDtoOutputScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshResponseDtoOutputScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshResponseDtoOutputScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshResponseDtoOutputAuthenticatedEnumSerializer
    implements PrimitiveSerializer<RefreshResponseDtoOutputAuthenticatedEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RefreshResponseDtoOutputAuthenticatedEnum
  ];
  @override
  final String wireName = 'RefreshResponseDtoOutputAuthenticatedEnum';

  @override
  Object serialize(Serializers serializers,
          RefreshResponseDtoOutputAuthenticatedEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshResponseDtoOutputAuthenticatedEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshResponseDtoOutputAuthenticatedEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshResponseDtoOutput extends RefreshResponseDtoOutput {
  @override
  final AnyOf anyOf;

  factory _$RefreshResponseDtoOutput(
          [void Function(RefreshResponseDtoOutputBuilder)? updates]) =>
      (RefreshResponseDtoOutputBuilder()..update(updates))._build();

  _$RefreshResponseDtoOutput._({required this.anyOf}) : super._();
  @override
  RefreshResponseDtoOutput rebuild(
          void Function(RefreshResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RefreshResponseDtoOutputBuilder toBuilder() =>
      RefreshResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RefreshResponseDtoOutput && anyOf == other.anyOf;
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
    return (newBuiltValueToStringHelper(r'RefreshResponseDtoOutput')
          ..add('anyOf', anyOf))
        .toString();
  }
}

class RefreshResponseDtoOutputBuilder
    implements
        Builder<RefreshResponseDtoOutput, RefreshResponseDtoOutputBuilder> {
  _$RefreshResponseDtoOutput? _$v;

  AnyOf? _anyOf;
  AnyOf? get anyOf => _$this._anyOf;
  set anyOf(AnyOf? anyOf) => _$this._anyOf = anyOf;

  RefreshResponseDtoOutputBuilder() {
    RefreshResponseDtoOutput._defaults(this);
  }

  RefreshResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _anyOf = $v.anyOf;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RefreshResponseDtoOutput other) {
    _$v = other as _$RefreshResponseDtoOutput;
  }

  @override
  void update(void Function(RefreshResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RefreshResponseDtoOutput build() => _build();

  _$RefreshResponseDtoOutput _build() {
    final _$result = _$v ??
        _$RefreshResponseDtoOutput._(
          anyOf: BuiltValueNullFieldError.checkNotNull(
              anyOf, r'RefreshResponseDtoOutput', 'anyOf'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
