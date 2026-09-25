// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_mutation_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AccountMutationResponseDtoOutputStatusEnum
    _$accountMutationResponseDtoOutputStatusEnum_ok =
    const AccountMutationResponseDtoOutputStatusEnum._('ok');

AccountMutationResponseDtoOutputStatusEnum
    _$accountMutationResponseDtoOutputStatusEnumValueOf(String name) {
  switch (name) {
    case 'ok':
      return _$accountMutationResponseDtoOutputStatusEnum_ok;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AccountMutationResponseDtoOutputStatusEnum>
    _$accountMutationResponseDtoOutputStatusEnumValues = BuiltSet<
        AccountMutationResponseDtoOutputStatusEnum>(const <AccountMutationResponseDtoOutputStatusEnum>[
  _$accountMutationResponseDtoOutputStatusEnum_ok,
]);

Serializer<AccountMutationResponseDtoOutputStatusEnum>
    _$accountMutationResponseDtoOutputStatusEnumSerializer =
    _$AccountMutationResponseDtoOutputStatusEnumSerializer();

class _$AccountMutationResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<AccountMutationResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ok': 'ok',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ok': 'ok',
  };

  @override
  final Iterable<Type> types = const <Type>[
    AccountMutationResponseDtoOutputStatusEnum
  ];
  @override
  final String wireName = 'AccountMutationResponseDtoOutputStatusEnum';

  @override
  Object serialize(Serializers serializers,
          AccountMutationResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  AccountMutationResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      AccountMutationResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$AccountMutationResponseDtoOutput
    extends AccountMutationResponseDtoOutput {
  @override
  final AccountMutationResponseDtoOutputStatusEnum status;

  factory _$AccountMutationResponseDtoOutput(
          [void Function(AccountMutationResponseDtoOutputBuilder)? updates]) =>
      (AccountMutationResponseDtoOutputBuilder()..update(updates))._build();

  _$AccountMutationResponseDtoOutput._({required this.status}) : super._();
  @override
  AccountMutationResponseDtoOutput rebuild(
          void Function(AccountMutationResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AccountMutationResponseDtoOutputBuilder toBuilder() =>
      AccountMutationResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccountMutationResponseDtoOutput && status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccountMutationResponseDtoOutput')
          ..add('status', status))
        .toString();
  }
}

class AccountMutationResponseDtoOutputBuilder
    implements
        Builder<AccountMutationResponseDtoOutput,
            AccountMutationResponseDtoOutputBuilder> {
  _$AccountMutationResponseDtoOutput? _$v;

  AccountMutationResponseDtoOutputStatusEnum? _status;
  AccountMutationResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(AccountMutationResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  AccountMutationResponseDtoOutputBuilder() {
    AccountMutationResponseDtoOutput._defaults(this);
  }

  AccountMutationResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccountMutationResponseDtoOutput other) {
    _$v = other as _$AccountMutationResponseDtoOutput;
  }

  @override
  void update(void Function(AccountMutationResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccountMutationResponseDtoOutput build() => _build();

  _$AccountMutationResponseDtoOutput _build() {
    final _$result = _$v ??
        _$AccountMutationResponseDtoOutput._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'AccountMutationResponseDtoOutput', 'status'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
