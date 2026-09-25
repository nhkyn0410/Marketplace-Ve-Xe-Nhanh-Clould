// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapInputDto extends SeatMapInputDto {
  @override
  final String name;
  @override
  final SeatMapInputDtoLayout layout;
  @override
  final BuiltList<SeatMapInputDtoSeatsInner> seats;

  factory _$SeatMapInputDto([void Function(SeatMapInputDtoBuilder)? updates]) =>
      (SeatMapInputDtoBuilder()..update(updates))._build();

  _$SeatMapInputDto._(
      {required this.name, required this.layout, required this.seats})
      : super._();
  @override
  SeatMapInputDto rebuild(void Function(SeatMapInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapInputDtoBuilder toBuilder() => SeatMapInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapInputDto &&
        name == other.name &&
        layout == other.layout &&
        seats == other.seats;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, layout.hashCode);
    _$hash = $jc(_$hash, seats.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapInputDto')
          ..add('name', name)
          ..add('layout', layout)
          ..add('seats', seats))
        .toString();
  }
}

class SeatMapInputDtoBuilder
    implements Builder<SeatMapInputDto, SeatMapInputDtoBuilder> {
  _$SeatMapInputDto? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  SeatMapInputDtoLayoutBuilder? _layout;
  SeatMapInputDtoLayoutBuilder get layout =>
      _$this._layout ??= SeatMapInputDtoLayoutBuilder();
  set layout(SeatMapInputDtoLayoutBuilder? layout) => _$this._layout = layout;

  ListBuilder<SeatMapInputDtoSeatsInner>? _seats;
  ListBuilder<SeatMapInputDtoSeatsInner> get seats =>
      _$this._seats ??= ListBuilder<SeatMapInputDtoSeatsInner>();
  set seats(ListBuilder<SeatMapInputDtoSeatsInner>? seats) =>
      _$this._seats = seats;

  SeatMapInputDtoBuilder() {
    SeatMapInputDto._defaults(this);
  }

  SeatMapInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _layout = $v.layout.toBuilder();
      _seats = $v.seats.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapInputDto other) {
    _$v = other as _$SeatMapInputDto;
  }

  @override
  void update(void Function(SeatMapInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapInputDto build() => _build();

  _$SeatMapInputDto _build() {
    _$SeatMapInputDto _$result;
    try {
      _$result = _$v ??
          _$SeatMapInputDto._(
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'SeatMapInputDto', 'name'),
            layout: layout.build(),
            seats: seats.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'layout';
        layout.build();
        _$failedField = 'seats';
        seats.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SeatMapInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
